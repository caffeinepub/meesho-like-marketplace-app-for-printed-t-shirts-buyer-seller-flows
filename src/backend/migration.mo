import Map "mo:core/Map";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Storage "blob-storage/Storage";

module {
  type ProductId = Nat32;
  type OrderId = Nat32;

  // Old types (before migration)
  type OldShippingAddress = {
    fullName : Text;
    phone : Text;
    addressLine1 : Text;
    addressLine2 : ?Text;
    city : Text;
    zip : Text;
  };

  type OldProduct = {
    productId : ProductId;
    title : Text;
    description : Text;
    priceCents : Nat;
    sizes : [Text];
    colors : [Text];
    imageRef : Storage.ExternalBlob;
  };

  type OldOrderItem = {
    productId : ProductId;
    quantity : Nat;
    size : Text;
    color : Text;
  };

  type OldOrder = {
    orderId : OrderId;
    buyer : Principal;
    items : [OldOrderItem];
    shippingAddress : OldShippingAddress;
    totalCents : Nat;
    status : {
      #placed;
      #confirmed;
      #shipped;
      #delivered;
      #cancelled;
    };
    createdAt : Int;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldMarketplaceSettings = {
    displayName : Text;
    tagline : Text;
    logo : ?Storage.ExternalBlob;
  };

  type OldReferralSummaryView = {
    referrer : Principal;
    referredUsers : [Principal];
    totalCommissions : Nat;
    availableBalance : Nat;
  };

  type OldPersistentReferralSummary = {
    referrer : Principal;
    referredUsers : List.List<Principal>;
    totalCommissions : Nat;
    availableBalance : Nat;
  };

  type OldActor = {
    products : Map.Map<ProductId, OldProduct>;
    orders : Map.Map<OrderId, OldOrder>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    referralCodes : Map.Map<Principal, Text>;
    reverseReferralCodes : Map.Map<Text, Principal>;
    referrerAssignments : Map.Map<Principal, Principal>;
    referralSummaries : Map.Map<Principal, OldPersistentReferralSummary>;
    nextProductId : ProductId;
    nextOrderId : OrderId;
    marketplaceSettings : OldMarketplaceSettings;
  };

  // New types (after migration)
  type NewProduct = {
    productId : ProductId;
    title : Text;
    description : Text;
    priceCents : Nat;
    sizes : [Text];
    colors : [Text];
    imageRef : Storage.ExternalBlob;
  };

  type NewOrder = {
    orderId : OrderId;
    buyer : Principal;
    items : [OldOrderItem];
    contactInfo : {
      email : Text;
      shippingAddress : OldShippingAddress;
    };
    totalCents : Nat;
    status : {
      #placed;
      #confirmed;
      #shipped;
      #delivered;
      #cancelled;
    };
    createdAt : Int;
    promoCode : ?Text;
    promoApplied : Bool;
  };

  type NewUserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    address : ?OldShippingAddress;
  };

  type NewMarketplaceSettings = {
    displayName : Text;
    tagline : Text;
    logo : ?Storage.ExternalBlob;
  };

  type NewReferralSummaryView = {
    referrer : Principal;
    referredUsers : [Principal];
    totalCommissions : Nat;
    availableBalance : Nat;
  };

  type NewPersistentReferralSummary = {
    referrer : Principal;
    referredUsers : List.List<Principal>;
    totalCommissions : Nat;
    availableBalance : Nat;
  };

  type NewActor = {
    products : Map.Map<ProductId, NewProduct>;
    orders : Map.Map<OrderId, NewOrder>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    referralCodes : Map.Map<Principal, Text>;
    reverseReferralCodes : Map.Map<Text, Principal>;
    referrerAssignments : Map.Map<Principal, Principal>;
    referralSummaries : Map.Map<Principal, NewPersistentReferralSummary>;
    nextProductId : ProductId;
    nextOrderId : OrderId;
    marketplaceSettings : NewMarketplaceSettings;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<ProductId, OldProduct, NewProduct>(
      func(_productId, oldProduct) { oldProduct }
    );

    let newOrders = old.orders.map<OrderId, OldOrder, NewOrder>(
      func(_orderId, oldOrder) {
        {
          oldOrder with
          contactInfo = {
            email = "";
            shippingAddress = oldOrder.shippingAddress;
          };
          promoCode = null;
          promoApplied = false;
        };
      }
    );

    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldUserProfile) {
        {
          oldUserProfile with
          email = "";
          phone = "";
          address = null;
        };
      }
    );

    let newReferralSummaries = old.referralSummaries.map<Principal, OldPersistentReferralSummary, NewPersistentReferralSummary>(
      func(_principal, oldPersistentReferralSummary) { oldPersistentReferralSummary }
    );

    {
      old with
      products = newProducts;
      orders = newOrders;
      userProfiles = newUserProfiles;
      referralSummaries = newReferralSummaries;
    };
  };
};
