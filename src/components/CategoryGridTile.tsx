import {
    Pressable,
    View,
    Text,
    StyleSheet,
    Platform,
    Image,
  } from "react-native";
  
  const image = "https://cdn-icons-png.flaticon.com/512/2226/2226124.png";
  
  function CategoryGridTile({ title, color, imageUrl, OnPress }: any) {
    return (
      <View style={styles.gridItem}>
        <Pressable
          android_ripple={{ color: "#ccc" }}
          style={({ pressed }) => [
            styles.button,
            pressed ? styles.buttonPressed : null,
          ]}
          onPress={OnPress}
        >
          <View style={[styles.innerContainer, { backgroundColor: color }]}>
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.image}
            />
            <Text style={styles.title}>{title}</Text>
          </View>
        </Pressable>
      </View>
    );
  }
  
  export default CategoryGridTile;
  
  const styles = StyleSheet.create({
    gridItem: {
      flex: 1,
      margin: 16,
      height: 150,
      borderRadius: 8,
      elevation: 4,
      backgroundColor: "white",
      shadowColor: "black",
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      overflow: Platform.OS === "android" ? "hidden" : "visible",
    },
    button: {
      flex: 1,
    },
    buttonPressed: {
      opacity: 0.5,
    },
    innerContainer: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: 100, // Adjust the size as needed
      height: 100, // Adjust the size as needed
      // borderRadius: 100, // Make it round
      marginBottom: 8, // Space between the image and the title
    },
    title: {
      fontWeight: "bold",
      fontSize: 18,
    },
  });