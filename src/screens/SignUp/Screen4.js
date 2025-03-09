import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function OnboardingStep1({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to extract?</Text>
      <Text style={styles.subtitle}>
        We selected some common extracts for you, but you can always change it later.
      </Text>

      {/* Example of selectable categories */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>📖 Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🎬 Films and Shows</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>🍽 Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>📚 Books</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Step2")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Step4")}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F6F2",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  option: {
    backgroundColor: "#FFDCDC",
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    color: "#D54B4B",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipText: {
    marginTop: 15,
    color: "#666",
  },
});