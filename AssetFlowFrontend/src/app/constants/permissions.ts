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
  }
} as const;
