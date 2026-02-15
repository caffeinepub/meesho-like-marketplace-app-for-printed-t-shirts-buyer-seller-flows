import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Nat32 "mo:core/Nat32";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type ProductId = Nat32;
  public type OrderId = Nat32;

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

  public type Product = {
    productId : ProductId;
    title : Text;
    description : Text;
    priceCents : Nat;
    sizes : [Text];
    colors : [Text];
    imageBlob : Blob;
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
    shippingAddress : ShippingAddress;
    totalCents : Nat;
    status : OrderStatus;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Product {
    public func compareByTitle(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.title, product2.title);
    };
  };

  let products = Map.empty<ProductId, Product>();
  var nextProductId : ProductId = 1;

  let orders = Map.empty<OrderId, Order>();
  var nextOrderId : OrderId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management (Admin only)
  public shared ({ caller }) func createProduct(
    title : Text,
    description : Text,
    priceCents : Nat,
    sizes : [Text],
    colors : [Text],
    imageBlob : Blob,
  ) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      productId = nextProductId;
      title;
      description;
      priceCents;
      sizes;
      colors;
      imageBlob;
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
    imageBlob : Blob,
  ) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
      imageBlob;
    };

    products.add(productId, updatedProduct);
    updatedProduct;
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {};
    };

    products.remove(productId);
  };

  // Product Listing (Public - no auth required)
  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort(Product.compareByTitle);
  };

  public query func getProduct(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Order Management
  public shared ({ caller }) func createOrder(
    items : [OrderItem],
    shippingAddress : ShippingAddress,
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

    let order : Order = {
      orderId = nextOrderId;
      buyer = caller;
      items;
      shippingAddress;
      totalCents;
      status = #placed;
      createdAt = 0;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order;
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
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

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder : Order = { existingOrder with status };
    orders.add(orderId, updatedOrder);
  };
};
