import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';

// @ts-ignore
import {
  Box,
  Heading,
  AspectRatio,
  Image,
  Center,
  HStack,
  Stack,
  ScrollView,
} from '@gluestack-ui/themed-native-base';

import {Text, NativeBaseProvider} from '@gluestack-ui/themed-native-base';

import {config} from '@gluestack-ui/config';

import {database} from '../../App';

const InstructionData = [
  {
    id: 1,
    imageTag: 'Imaging Rig Front',
    title: 'Step 1:',
    point: 'Place the phone on the imaging rig',
    description:
      'description on how to achive this step in detail. aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
    result: 'Outcome: Camera mesh alighning with the microchip',
    image:
      'https://149367133.v2.pressablecdn.com/wp-content/uploads/2018/10/GadgetMatch-20181008-Smartphone-Pro-Mode-Tutorial-01.gif',
  },
  {
    id: 2,
    imageTag: 'Imaging Rig Front',
    title: 'Step 2:',
    point: 'Turn on your phone and go to the camera app.',
    description:
      'description on how to achive this step in detail. aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
    result: 'Outcome: Camera mesh alighning with the microchip',
    image:
      'https://www.holidify.com/images/cmsuploads/compressed/Bangalore_citycover_20190613234056.jpg',
  },
  {
    id: 3,
    imageTag: 'Imaging Rig Front',
    title: 'Step 3:',
    point: 'Turn on your phone and go to the camera app.',
    description:
      'description on how to achive this step in detail. aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
    result: 'Outcome: Camera mesh alighning with the microchip',
    image:
      'https://149367133.v2.pressablecdn.com/wp-content/uploads/2018/10/GadgetMatch-20181008-Smartphone-Pro-Mode-Tutorial-01.gif',
  },
  {
    id: 4,
    imageTag: 'Imaging Rig Front',
    title: 'Step 4:',
    point: 'Turn on your phone and go to the camera app.',
    description:
      'description on how to achive this step in detail. aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
    result: 'Outcome: Camera mesh alighning with the microchip',
    image:
      'https://149367133.v2.pressablecdn.com/wp-content/uploads/2018/10/GadgetMatch-20181008-Smartphone-Pro-Mode-Tutorial-01.gif',
  },
  {
    id: 5,
    imageTag: 'Imaging Rig Front',
    title: 'Step 5:',
    description:
      'description on how to achive this step in detail. aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
    result: 'Outcome: Camera mesh alighning with the microchip',
    point: 'Turn on your phone and go to the camera app.',
    image: 'https://cdn-icons-png.flaticon.com/512/2226/2226124.png',
  },
];

type SectionProps = PropsWithChildren<{}>;

function Instructions({children}: SectionProps): React.JSX.Element {
  const postsCollection = database.get('posts');

  useEffect(() => {
    const fetchData = async () => {
      console.log('database', database);
      await database.write(async () => {
        console.log('data create...');
        const newPost = await database.get('posts').create(post => {
          post.title = 'New post4';
          post.body = 'Lorem ipsum...2';
        });
        console.log('data created...', newPost);
      });

      console.log('data-querying1');
      const posts = await database.get('posts').query().fetch();
      console.log('posts', [posts]);
      posts.map(post => {
        console.log('post 11', post.title);
      });

      console.log('data-querying2');

      // const postId = 'abcdefgh';
      // const postFiltered = database.get('posts').find(postId);
      // console.log('post2', postFiltered);
    };
    fetchData();
    console.log('logg1');
  }, []);

  const onRead = async () => {
    const allPosts = await database.get('posts').query().fetch();
    console.log(allPosts);
    allPosts.map(post => {
      console.log(post.title);
    });
  };

  const onDelete = async () => {
    const numberOfStarredPosts = await database
      .get('posts')
      .query(Q.where('is_pinned', true))
      .fetch();
    if (numberOfStarredPosts.length) {
      await database.write(async () => {
        await numberOfStarredPosts[0].destroyPermanently();
      });
    }
  };

  const onCreate = async () => {
    await database.write(async () => {
      const newPost = await database.get('posts').create(post => {
        post.title = 'New post';
        post.body = 'Lorem ipsum...';
        post.isPinned = false;
        post.subtitle = 'Some subtitle';
      });
      console.log(newPost);
    });
  };

  const onUpdate = async () => {
    const numberOfStarredPosts = await database
      .get('posts')
      .query(Q.where('is_pinned', true))
      .fetch();
    if (numberOfStarredPosts.length) {
      await database.write(async () => {
        await numberOfStarredPosts[0].update(post => {
          post.title = 'Updated title';
        });
      });
    }
  };

  return (
    <NativeBaseProvider>
      <ScrollView>
        {InstructionData.map(step => (
          <Center flex={1} px="3" marginTop={10} key={step.id}>
            <Box alignItems="center">
              <Box
                width="90%"
                rounded="lg"
                overflow="hidden"
                borderColor="coolGray.200"
                borderWidth="1"
                _dark={{
                  borderColor: 'coolGray.600',
                  backgroundColor: 'gray.700',
                }}
                _web={{
                  shadow: 2,
                  borderWidth: 0,
                }}
                _light={{
                  backgroundColor: 'gray.50',
                }}>
                <Box>
                  <AspectRatio w="100%" ratio={16 / 9}>
                    <Image
                      // source={{
                      //   uri: "https://www.holidify.com/images/cmsuploads/compressed/Bangalore_citycover_20190613234056.jpg",
                      // }}
                      source={{
                        uri: step.image,
                      }}
                      alt="image"
                      // width="350px"
                      // height="250px"
                    />
                  </AspectRatio>
                  <Center
                    bg="violet.500"
                    _dark={{
                      bg: 'violet.400',
                    }}
                    _text={{
                      color: 'warmGray.50',
                      fontWeight: '700',
                      fontSize: 'xs',
                    }}
                    position="absolute"
                    bottom="0"
                    px="3"
                    py="1.5">
                    {step.imageTag}
                  </Center>
                </Box>
                <Stack p="4" space={3}>
                  <Stack space={2}>
                    <Heading size="md" ml="-1">
                      {step.title}
                    </Heading>
                    <Text
                      fontSize="xs"
                      _light={{
                        color: 'violet.500',
                      }}
                      _dark={{
                        color: 'violet.400',
                      }}
                      fontWeight="500"
                      ml="-0.5"
                      mt="-1">
                      {step.point}
                    </Text>
                  </Stack>
                  <Text fontWeight="400">{step.description}</Text>
                  <HStack
                    alignItems="center"
                    space={4}
                    justifyContent="space-between">
                    <HStack alignItems="center">
                      <Text
                        color="coolGray.600"
                        _dark={{
                          color: 'warmGray.200',
                        }}
                        fontWeight="400">
                        {step.result}
                      </Text>
                    </HStack>
                  </HStack>
                </Stack>
              </Box>
            </Box>
          </Center>
        ))}
      </ScrollView>
    </NativeBaseProvider>
  );
}

export default Instructions;
