import React from 'react';
import {StyleSheet, ScrollView, Image, View} from 'react-native';
import {DataTable, Button} from 'react-native-paper';

function Report() {
  return (
    <ScrollView>
      <Image
        source={{
          uri: 'https://www.microtechnix.com/wp-content/uploads/2022/05/Emma-Incident-light-DF.jpg',
        }}
        style={styles.image}
        alt="Microchip image"
      />
      <Button
        buttonColor={'red'}
        textColor="white"
        icon={'camera'}
        style={styles.button}>
        Report (Improper Detection)
      </Button>
      <View style={styles.tableContainer}>
        <DataTable style={styles.container}>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Favourite Food</DataTable.Title>
            <DataTable.Title>Age</DataTable.Title>
          </DataTable.Header>
          <DataTable.Row>
            <DataTable.Cell>Radhika</DataTable.Cell>
            <DataTable.Cell>Dosa</DataTable.Cell>
            <DataTable.Cell>23</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>Krishna</DataTable.Cell>
            <DataTable.Cell>Uttapam</DataTable.Cell>
            <DataTable.Cell>26</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Vanshika</DataTable.Cell>
            <DataTable.Cell>Brownie</DataTable.Cell>
            <DataTable.Cell>20</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Teena</DataTable.Cell>
            <DataTable.Cell>Pizza</DataTable.Cell>
            <DataTable.Cell>24</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Teena</DataTable.Cell>
            <DataTable.Cell>Pizza</DataTable.Cell>
            <DataTable.Cell>24</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell>Teena</DataTable.Cell>
            <DataTable.Cell>Pizza</DataTable.Cell>
            <DataTable.Cell>24</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </View>
    </ScrollView>
  );
}

export default Report;

const styles = StyleSheet.create({
  image: {
    height: 280,
    width: '65%',
    marginBottom: 20,
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 10,
  },
  button: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  tableContainer: {
    alignSelf: 'center',
    height: 'auto',
    backgroundColor: 'black',
    width: '100%',
  },
  container: {
    padding: 15,
  },
});
