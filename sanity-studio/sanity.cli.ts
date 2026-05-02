import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '87awwrcu',
    dataset: 'production'
  },
  deployment: {
    autoUpdates: true,
    appId: 'n204609911mffjbdowbq1s7a',
  }
})
