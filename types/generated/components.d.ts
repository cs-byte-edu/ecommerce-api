import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCategoryCard extends Struct.ComponentSchema {
  collectionName: 'components_blocks_category_cards';
  info: {
    description: '';
    displayName: 'Category Card';
  };
  attributes: {
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
    heading: Schema.Attribute.String;
  };
}

export interface BlocksCategoryTabs extends Struct.ComponentSchema {
  collectionName: 'components_blocks_category_tabs';
  info: {
    description: '';
    displayName: 'Category tabs';
  };
  attributes: {
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
  };
}

export interface LayoutHero extends Struct.ComponentSchema {
  collectionName: 'components_layout_heroes';
  info: {
    description: '';
    displayName: 'Hero';
  };
  attributes: {
    hero_img: Schema.Attribute.Media<'images'>;
    typography: Schema.Attribute.Component<'shared.heading', true>;
  };
}

export interface LayoutSectionBenefits extends Struct.ComponentSchema {
  collectionName: 'components_layout_section_benefits';
  info: {
    description: '';
    displayName: 'Section benefits';
  };
  attributes: {
    benefits: Schema.Attribute.Relation<'oneToMany', 'api::benefit.benefit'>;
    section_description: Schema.Attribute.Text;
    section_heading: Schema.Attribute.String;
  };
}

export interface LayoutSectionCategory extends Struct.ComponentSchema {
  collectionName: 'components_layout_section_categories';
  info: {
    displayName: 'Section category';
  };
  attributes: {
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
    section_description: Schema.Attribute.Text;
    section_heading: Schema.Attribute.String;
  };
}

export interface SharedFilterValue extends Struct.ComponentSchema {
  collectionName: 'components_shared_filter_values';
  info: {
    displayName: 'Filter value';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<['select', 'checkbox', 'radio']> &
      Schema.Attribute.Required;
  };
}

export interface SharedHeading extends Struct.ComponentSchema {
  collectionName: 'components_shared_headings';
  info: {
    description: '';
    displayName: 'Typography';
  };
  attributes: {
    type: Schema.Attribute.Enumeration<['h1', 'h2', 'h3', 'h4', 'h5', 'p']>;
    typography_content: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.category-card': BlocksCategoryCard;
      'blocks.category-tabs': BlocksCategoryTabs;
      'layout.hero': LayoutHero;
      'layout.section-benefits': LayoutSectionBenefits;
      'layout.section-category': LayoutSectionCategory;
      'shared.filter-value': SharedFilterValue;
      'shared.heading': SharedHeading;
    }
  }
}
