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
  },
  Supplier: {
    Create: 'Supplier.Create',
    Update: 'Supplier.Update',
    View: 'Supplier.View',
    Delete: 'Supplier.Delete'
  },
  MaintenanceType: {
    Create: 'MaintenanceType.Create',
    Update: 'MaintenanceType.Update',
    View: 'MaintenanceType.View',
    Delete: 'MaintenanceType.Delete'
  },
  MaintenanceChecklist: {
    Create: 'MaintenanceChecklist.Create',
    Update: 'MaintenanceChecklist.Update',
    View: 'MaintenanceChecklist.View',
    Delete: 'MaintenanceChecklist.Delete'
  },
  MaintenanceSchedule: {
    Create: 'MaintenanceSchedule.Create',
    Update: 'MaintenanceSchedule.Update',
    View: 'MaintenanceSchedule.View',
    Delete: 'MaintenanceSchedule.Delete'
  },
  PreventiveMaintenance: {
    View: 'PreventiveMaintenance.View',
    Update: 'PreventiveMaintenance.Update',
    Complete: 'PreventiveMaintenance.Complete',
    Generate: 'PreventiveMaintenance.Generate'
  },
  IssueCategory: {
    Create: 'IssueCategory.Create',
    Update: 'IssueCategory.Update',
    View: 'IssueCategory.View',
    Delete: 'IssueCategory.Delete'
  },
  AssetIssue: {
    Create: 'AssetIssue.Create',
    Update: 'AssetIssue.Update',
    View: 'AssetIssue.View',
    Delete: 'AssetIssue.Delete'
  },
  WorkOrder: {
    View: 'WorkOrder.View',
    Create: 'WorkOrder.Create',
    Update: 'WorkOrder.Update',
    Delete: 'WorkOrder.Delete',
    Assign: 'WorkOrder.Assign',
    Reassign: 'WorkOrder.Reassign',
    Accept: 'WorkOrder.Accept',
    Start: 'WorkOrder.Start',
    Pause: 'WorkOrder.Pause',
    Resume: 'WorkOrder.Resume',
    Complete: 'WorkOrder.Complete',
    Approve: 'WorkOrder.Approve',
    Reject: 'WorkOrder.Reject',
    Reopen: 'WorkOrder.Reopen',
    Cancel: 'WorkOrder.Cancel'
  },
  PartReplacement: {
    View: 'PartReplacement.View',
    Create: 'PartReplacement.Create',
    Validate: 'PartReplacement.Validate',
    Replace: 'PartReplacement.Replace',
    Delete: 'PartReplacement.Delete'
  },
  AssetHistory: {
    View: 'AssetHistory.View'
  },
  CostManagement: {
    View: 'CostManagement.View',
    Create: 'CostManagement.Create',
    Update: 'CostManagement.Update',
    Delete: 'CostManagement.Delete'
  },
  Dashboard: {
    View: 'Dashboard.View'
  },
  Reports: {
    View: 'Reports.View'
  }
} as const;
