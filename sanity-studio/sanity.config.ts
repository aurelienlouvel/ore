import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {
  ProjectNavIcon,
  TagNavIcon,
  OrganisationNavIcon,
  PersonNavIcon,
  RoleNavIcon,
} from './schemaTypes/components/navIcons'

export default defineConfig({
  name: 'default',
  title: 'oré ˖ ࣪⊹',

  projectId: '87awwrcu',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('project').title('Project').icon(ProjectNavIcon),
            S.documentTypeListItem('tag').title('Tag').icon(TagNavIcon),
            S.documentTypeListItem('organisation').title('Organisation').icon(OrganisationNavIcon),
            S.documentTypeListItem('person').title('Person').icon(PersonNavIcon),
            S.documentTypeListItem('role').title('Role').icon(RoleNavIcon),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
