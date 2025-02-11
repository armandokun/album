import { faker } from '@faker-js/faker'

const data = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  created_at: faker.date.recent().toISOString(),
  image_url: faker.image.urlPicsumPhotos({
    width: 300,
    height: 300 * 1.4,
    blur: 0,
  }),
  image_blurhash:
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[',
  description: faker.lorem.sentences({ min: 1, max: 3 }),
  author: {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatar_url: faker.image.avatarGitHub(),
  },
  comments: [{ count: faker.number.int({ min: 0, max: 10 }) }],
}))

export type Post = (typeof data)[0]
export default data
