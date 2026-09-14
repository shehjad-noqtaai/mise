import {Flex, Spinner} from '@sanity/ui'

const Loading = () => (
  <Flex align="center" height="fill" justify="center" style={{width: '100vw'}}>
    <Spinner />
  </Flex>
)

export default Loading
