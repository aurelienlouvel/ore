import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

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
            S.documentTypeListItem('project').title('Projects'),
            S.divider(),
            S.documentTypeListItem('tag').title('Tags'),
            S.documentTypeListItem('organisation').title('Organisations'),
            S.documentTypeListItem('person').title('People'),
            S.documentTypeListItem('role').title('Roles'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
