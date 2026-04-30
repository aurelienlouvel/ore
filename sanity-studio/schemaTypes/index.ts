import {tagType} from './tag'
import {roleType} from './role'
import {organisationType} from './organisation'
import {personType} from './person'
import {
  sectionTextType,
  sectionImagesType,
  sectionVideoType,
  sectionIntegrationType,
  sectionSubPageType,
} from './sections'
import {projectType} from './project'

export const schemaTypes = [
  // Reusable references
  tagType,
  roleType,
  organisationType,
  personType,
  // Section object types
  sectionTextType,
  sectionImagesType,
  sectionVideoType,
  sectionIntegrationType,
  sectionSubPageType,
  // Documents
  projectType,
]
