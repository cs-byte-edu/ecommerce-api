import type { Schema, Struct } from '@strapi/strapi';

export interface ProductAttribute extends Struct.ComponentSchema {
  collectionName: 'components_product_attributes';
  info: {
    displayName: 'attribute';
  };
  attributes: {
    key: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface ProductProductSet extends Struct.ComponentSchema {
  collectionName: 'components_product_product_sets';
  info: {
    displayName: 'bundle item';
  };
  attributes: {};
}

export interface SectionsSectionCategory extends Struct.ComponentSchema {
  collectionName: 'components_sections_section_categories';
  info: {
    displayName: 'Section category';
  };
  attributes: {
    section_categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    >;
    section_description: Schema.Attribute.Text;
    section_heading: Schema.Attribute.String;
    section_type: Schema.Attribute.Enumeration<
      ['block', 'tabs', 'accordion', 'carousel', 'menu', 'card']
    >;
  };
}

export interface SectionsSectionContent extends Struct.ComponentSchema {
  collectionName: 'components_sections_section_contents';
  info: {
    displayName: 'Section content';
  };
  attributes: {
    content_categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::content-category.content-category'
    >;
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    description: '';
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.attribute': ProductAttribute;
      'product.product-set': ProductProductSet;
      'sections.section-category': SectionsSectionCategory;
      'sections.section-content': SectionsSectionContent;
      'shared.link': SharedLink;
    }
  }
}
