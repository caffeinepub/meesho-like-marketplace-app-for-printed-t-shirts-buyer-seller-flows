import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

// Persistent actor with migration
(with migration = Migration.run)
actor {
  type ProductId = Nat32;
  type OrderId = Nat32;

  public type AddToCartInput = {
    productId : ProductId;
    quantity : Nat;
    size : Text;
    color : Text;
  };

  public type OrderStatus = {
    #placed;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type ShippingAddress = {
    fullName : Text;
    phone : Text;
    addressLine1 : Text;
    addressLine2 : ?Text;
    city : Text;
    zip : Text;
  };

  public type ContactInfo = {
    email : Text;
    shippingAddress : ShippingAddress;
  };

  public type Product = {
    productId : ProductId;
    title : Text;
    description : Text;
    priceCents : Nat;
    sizes : [Text];
    colors : [Text];
    imageRef : Storage.ExternalBlob;
  };

  public type OrderItem = {
    productId : ProductId;
    quantity : Nat;
    size : Text;
    color : Text;
  };

  public type Order = {
    orderId : OrderId;
    buyer : Principal;
    items : [OrderItem];
    contactInfo : ContactInfo;
    totalCents : Nat;
    status : OrderStatus;
    createdAt : Int;
    promoCode : ?Text;
    promoApplied : Bool;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    address : ?ShippingAddress;
  };

  public type MarketplaceSettings = {
    displayName : Text;
    tagline : Text;
    logo : ?Storage.ExternalBlob;
  };

  public type ReferralSummaryView = {
    referrer : Principal;
    referredUsers : [Principal];
    totalCommissions : Nat;
    availableBalance : Nat;
  };

  type PersistentReferralSummary = {
    referrer : Principal;
    referredUsers : List.List<Principal>;
    totalCommissions : Nat;
    availableBalance : Nat;
  };

  let products = Map.empty<ProductId, Product>();
  let orders = Map.empty<OrderId, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let referralCodes = Map.empty<Principal, Text>();
  let reverseReferralCodes = Map.empty<Text, Principal>();
  let referrerAssignments = Map.empty<Principal, Principal>();
  let referralSummaries = Map.empty<Principal, PersistentReferralSummary>();
  var nextProductId : ProductId = 1;
  var nextOrderId : OrderId = 1;
  var marketplaceSettings : MarketplaceSettings = {
    displayName = "AMERICAN PRINTERS";
    tagline = "Unique printers, legend stop.";
    logo = null;
  };

  module Product {
    public func compareByTitle(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.title, product2.title);
    };
  };

  // System components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func grantAdminRole(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can grant admin roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, #admin);
  };

  public shared ({ caller }) func revokeAdminRole(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can revoke admin roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, #user);
  };

  public shared ({ caller }) func grantUserRole(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can grant user roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, #user);
  };

  public query ({ caller }) func getMarketplaceSettings() : async MarketplaceSettings {
    marketplaceSettings;
  };

  public shared ({ caller }) func saveMarketplaceName(newName : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update marketplace name");
    };
    marketplaceSettings := {
      marketplaceSettings with displayName = newName;
    };
  };

  public shared ({ caller }) func updateTagline(newTagline : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update marketplace tagline");
    };
    marketplaceSettings := {
      marketplaceSettings with tagline = newTagline;
    };
  };

  public shared ({ caller }) func saveMarketplaceLogo(logo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update marketplace logo");
    };
    marketplaceSettings := {
      marketplaceSettings with logo = ?logo;
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(
    profile : UserProfile,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their profile");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func deleteCallerUserProfile() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their profile");
    };
    userProfiles.remove(caller);
  };

  public shared ({ caller }) func createProduct(
    title : Text,
    description : Text,
    priceCents : Nat,
    sizes : [Text],
    colors : [Text],
    image : Storage.ExternalBlob,
  ) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      productId = nextProductId;
      title;
      description;
      priceCents;
      sizes;
      colors;
      imageRef = image;
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(
    productId : ProductId,
    title : Text,
    description : Text,
    priceCents : Nat,
    sizes : [Text],
    colors : [Text],
    image : Storage.ExternalBlob,
  ) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    let updatedProduct : Product = {
      existingProduct with
      title;
      description;
      priceCents;
      sizes;
      colors;
      imageRef = image;
    };

    products.add(productId, updatedProduct);
    updatedProduct;
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {};
    };

    products.remove(productId);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort(Product.compareByTitle);
  };

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  let validPromoCodes = [
    "X7P9K2Q4",
    "L3M8Z1T6",
    "R5V2N9C7",
    "B8Q4Y6W1",
    "T2H7J5K9",
    "P9D3F8L2",
    "Z4X6C1V8",
    "N7M2A5S9",
    "K1R8E4T3",
    "W6Y9U2I5",
    "C3B7N1M8",
    "J8L4P6Q2",
  ];

  public shared ({ caller }) func createOrder(
    items : [OrderItem],
    contactInfo : ContactInfo,
    promoCode : ?Text,
  ) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    if (items.size() == 0) {
      Runtime.trap("Order must have at least one item");
    };

    let totalCents = items.foldLeft(
      0,
      func(acc, item) {
        let product = switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?product) { product };
        };
        acc + (product.priceCents * item.quantity);
      },
    );

    var finalTotal = totalCents;
    var promoApplied = false;

    switch (promoCode) {
      case (?code) {
        if (isPromoCodeValid(code)) {
          if (not hasUserUsedPromoCode(caller, code)) {
            finalTotal /= 2;
            promoApplied := true;
            recordPromoCodeUsage(caller, code);
          };
        };
      };
      case (null) {};
    };

    let order : Order = {
      orderId = nextOrderId;
      buyer = caller;
      items;
      contactInfo;
      totalCents = finalTotal;
      status = #placed;
      createdAt = Time.now();
      promoCode;
      promoApplied;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order;
  };

  func isPromoCodeValid(code : Text) : Bool {
    validPromoCodes.find(func(valid) { valid == code }) != null;
  };

  func hasUserUsedPromoCode(_user : Principal, _code : Text) : Bool {
    false;
  };

  func recordPromoCodeUsage(_user : Principal, _code : Text) {};

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };

    if (caller != order.buyer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    order;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };

    orders
    .values()
    .toArray()
    .filter(func(order) { order.buyer == caller });
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : OrderId,
    status : OrderStatus,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = { existingOrder with status };
    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func getOrCreateReferralCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can generate referral codes");
    };

    switch (referralCodes.get(caller)) {
      case (?existing) { existing };
      case (null) {
        let code = caller.toText();
        referralCodes.add(caller, code);
        reverseReferralCodes.add(code, caller);
        code;
      };
    };
  };

  public shared ({ caller }) func applyReferralCode(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be signed in and not anonymous");
    };

    switch (reverseReferralCodes.get(code)) {
      case (?referrer) {
        if (referrer == caller) {
          Runtime.trap("Cannot refer yourself");
        };
        referrerAssignments.add(caller, referrer);

        switch (referralSummaries.get(referrer)) {
          case (null) {
            referralSummaries.add(
              referrer,
              {
                referrer;
                referredUsers = List.singleton(caller);
                totalCommissions = 0;
                availableBalance = 0;
              },
            );
          };
          case (?existing) {
            let updated = { existing with referredUsers = existing.referredUsers };
            referralSummaries.add(referrer, updated);
          };
        };
      };
      case (null) { Runtime.trap("Invalid referral code") };
    };
  };

  func getReferralSummaryForUser(user : Principal) : ReferralSummaryView {
    switch (referralSummaries.get(user)) {
      case (?summary) {
        {
          summary with
          referredUsers = summary.referredUsers.toArray();
        };
      };
      case (null) { Runtime.trap("No referrals found") };
    };
  };

  public query ({ caller }) func getReferralSummary(
    user : Principal,
  ) : async ReferralSummaryView {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referral summary");
    };

    getReferralSummaryForUser(user);
  };

  public query ({ caller }) func getOwnReferralSummary() : async ReferralSummaryView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view referral summary");
    };

    getReferralSummaryForUser(caller);
  };

  // ------------- FOUNDERS SYSTEM --------------//

  public query ({ caller }) func isFounderEmail(email : Text) : async Bool {
    email == "mercutiose369@gmail.com";
  };
};
