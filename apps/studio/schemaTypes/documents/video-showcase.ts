import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'
import {defineVideoField} from 'sanity/media-library'

export const videoShowcase = defineType({
  name: 'videoShowcase',
  title: 'Video Showcase',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'datasetVideo',
      title: 'Dataset Video (file asset)',
      type: 'file',
      description:
        'Stored as a sanity.fileAsset in the project dataset and served as-is from cdn.sanity.io — no transcoding or streaming.',
      options: {accept: 'video/*'},
    }),
    defineVideoField({
      name: 'streamingVideo',
      title: 'Streaming Video (Media Library)',
      description: 'Stored in the org Media Library and streamed as HLS via a Mux playback ID.',
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare({title}) {
      return {title: title ?? 'Video Showcase', subtitle: 'Dataset vs Media Library video'}
    },
  },
})
