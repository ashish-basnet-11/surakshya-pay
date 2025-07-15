import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'

const login = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput 
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <TextInput
       placeholder="Password"
       placeholderTextColor="#ccc"
       secureTextEntry
       style={styles.input}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  )
}

export default login

const styles = StyleSheet.create({})