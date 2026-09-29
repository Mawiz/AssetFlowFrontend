export const Permissions = {
  User: {
    Create: 'User.Create',
    Update: 'User.Update',
    View: 'User.View',
    List: 'User.List',
    Toggle: 'User.Toggle'
  },
  Role: {
    Create: 'Role.Create',
    Update: 'Role.Update',
    View: 'Role.View',
    List: 'Role.List'
  },
  Resource: {
    Create: 'Resource.Create',
    Update: 'Resource.Update',
    View: 'Resource.View',
    List: 'Resource.List'
  },
  Tenant: {
    Create: 'Tenant.Create',
    Update: 'Tenant.Update',
    View: 'Tenant.View',
    List: 'Tenant.List',
    Toggle: 'Tenant.Toggle'
  },
  Subscription: {
    Create: 'Subscription.Create',
    Update: 'Subscription.Update',
    View: 'Subscription.View',
    List: 'Subscription.List',
    Toggle: 'Subscription.Toggle',
    Delete: 'Subscription.Delete'
  },
  MetaData: {
    View: 'MetaData.View'
  },
  LocationType: {
    Create: 'LocationType.Create',
    Update: 'LocationType.Update',
    View: 'LocationType.View',
    Delete: 'LocationType.Delete'
  },
  Location: {
    Create: 'Location.Create',
    Update: 'Location.Update',
    View: 'Location.View',
    Delete: 'Location.Delete'
  },
  AssetCategory: {
    Create: 'AssetCategory.Create',
    Update: 'AssetCategory.Update',
    View: 'AssetCategory.View',
    Delete: 'AssetCategory.Delete'
  },
  AssetType: {
    Create: 'AssetType.Create',
    Update: 'AssetType.Update',
    View: 'AssetType.View',
    Delete: 'AssetType.Delete'
  },
  Asset: {
    Create: 'Asset.Create',
    Update: 'Asset.Update',
    View: 'Asset.View',
    Delete: 'Asset.Delete'
  },
  AssetComponent: {
    Create: 'AssetComponent.Create',
    Update: 'AssetComponent.Update',
    View: 'AssetComponent.View',
    Delete: 'AssetComponent.Delete'
  },
  PartCategory: {
    Create: 'PartCategory.Create',
    Update: 'PartCategory.Update',
    View: 'PartCategory.View',
    Delete: 'PartCategory.Delete'
  },
  Part: {
    Create: 'Part.Create',
    Update: 'Part.Update',
    View: 'Part.View',
    Delete: 'Part.Delete'
  },
  PartInventory: {
    Create: 'PartInventory.Create',
    Update: 'PartInventory.Update',
    View: 'PartInventory.View',
    Delete: 'PartInventory.Delete'
  },
  PartTransaction: {
    Create: 'PartTransaction.Create',
    Update: 'PartTransaction.Update',
    View: 'PartTransaction.View',
    Delete: 'PartTransaction.Delete'
  }
} as const;
