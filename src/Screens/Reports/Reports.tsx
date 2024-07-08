import {StyleSheet, Pressable} from 'react-native';

import {
  Box,
  FlatList,
  Heading,
  Avatar,
  HStack,
  VStack,
  Text,
  Center,
  Spacer,
  NativeBaseProvider,
} from '@gluestack-ui/themed-native-base';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type Item = {
  id: string;
  fullName: string;
  timeStamp: string;
  recentText: string;
  avatarUrl: string;
};

function Reports({navigation}: any) {
  const data: Item[] = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      fullName: 'test #1',
      timeStamp: 'March 23th \n12:47 PM',
      recentText: 'Water test',
      avatarUrl:
        'https://img.freepik.com/premium-photo/macro-close-up-shot-bacteria-virus-cells-scientific-laboratory-petri-dish-generative-ai_438099-11605.jpg',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      fullName: 'test #2',
      timeStamp: 'March 23th \n11:11 PM',
      recentText: 'Water test',
      avatarUrl:
        'https://img.freepik.com/premium-photo/macro-close-up-shot-bacteria-virus-cells-scientific-laboratory-petri-dish-generative-ai_438099-11605.jpg',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      fullName: 'test #3',
      timeStamp: 'March 23th \n6:22 PM',
      recentText: 'Water test',
      avatarUrl:
        'https://img.freepik.com/premium-photo/macro-close-up-shot-bacteria-virus-cells-scientific-laboratory-petri-dish-generative-ai_438099-11605.jpg',
    },
    {
      id: '68694a0f-3da1-431f-bd56-142371e29d72',
      fullName: 'test #4',
      timeStamp: 'March 23th \n8:56 PM',
      recentText: 'Water test',
      avatarUrl:
        'https://img.freepik.com/premium-photo/macro-close-up-shot-bacteria-virus-cells-scientific-laboratory-petri-dish-generative-ai_438099-11605.jpg',
    },
    {
      id: '28694a0f-3da1-471f-bd96-142456e29d72',
      fullName: 'test #5',
      timeStamp: 'March 23th \n12:47 PM',
      recentText: 'Water test',
      avatarUrl:
        'https://img.freepik.com/premium-photo/macro-close-up-shot-bacteria-virus-cells-scientific-laboratory-petri-dish-generative-ai_438099-11605.jpg',
    },
  ];

  const testFunction = (item: Item) => {
    console.log('Pressed item:', item);
    // You can navigate or perform other actions here
    navigation.navigate('ReportDetail', {itemId: item.id});
  };
  return (
    <>
      <NativeBaseProvider>
        <Box>
          <FlatList
            data={data}
            renderItem={({item}: {item: Item}) => (
              <Pressable onPress={() => testFunction(item)}>
                <Box
                  borderBottomWidth="1"
                  _dark={{
                    borderColor: 'muted.50',
                  }}
                  borderColor="muted.800"
                  pl={['2', '4']}
                  pr={['2', '5']}
                  py="2">
                  <HStack space={[2, 3]} justifyContent="space-between">
                    <Avatar
                      size="48px"
                      source={{
                        uri: item.avatarUrl,
                      }}
                    />
                    <VStack>
                      <Text
                        _dark={{
                          color: 'warmGray.50',
                        }}
                        color="coolGray.800"
                        bold>
                        {item.fullName}
                      </Text>
                      <Text
                        color="coolGray.600"
                        _dark={{
                          color: 'warmGray.200',
                        }}>
                        {item.recentText}
                      </Text>
                    </VStack>
                    <Spacer />
                    <Text
                      fontSize="xs"
                      _dark={{
                        color: 'warmGray.50',
                      }}
                      color="coolGray.800"
                      alignSelf="flex-start">
                      {item.timeStamp}
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            )}
            keyExtractor={(item: Item) => item.id}
          />
        </Box>
      </NativeBaseProvider>
    </>
  );
}

export default Reports;
