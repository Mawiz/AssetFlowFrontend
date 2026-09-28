export interface EntityMetaDataItem {
  metaDataKeyId: number;
  metaDataKeyName?: string;
  metaDataKeyDisplayName?: string;
  value: string;
}

export interface MetaDataKeyDefinition {
  id: number;
  name: string;
  displayName: string;
  applicableEntityType?: string;
}
