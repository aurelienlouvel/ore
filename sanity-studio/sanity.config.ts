import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {schemaTypes} from './schemaTypes'
import {
  ArtifactNavIcon,
  ExperienceNavIcon,
  ContractTypeNavIcon,
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
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({
              type: 'project',
              title: 'Project',
              icon: ProjectNavIcon,
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: 'artifact',
              title: 'Artifact',
              icon: ArtifactNavIcon,
              S,
              context,
            }),
            orderableDocumentListDeskItem({
              type: 'experience',
              title: 'Experience',
              icon: ExperienceNavIcon,
              S,
              context,
            }),
            S.documentTypeListItem('contractType').title('Contract type').icon(ContractTypeNavIcon),
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
