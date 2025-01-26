import React, { useState } from 'react';
import { View, Text, Button, TextInput, Image, StyleSheet, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView} from 'react-native';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import Logo from '../../../assets/images/tmplogo.png';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const SignIn = () => {
    const {height} = useWindowDimensions();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const logIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error) {
            console.log(error);
            alert('login failed');
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('check mail');
        } catch (error) {
            console.log(error);
            alert('signup failed');
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <View style={styles.root}>
            <Image source = {Logo} style={[styles.logo, {height: height * 0.45}]} resizeMode='contain'/>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)}></TextInput>
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="password" autoCapitalize="none" onChangeText={(text) => setPassword(text)}></TextInput>
            
            { loading ? (
                <ActivityIndicator size="large" color="#0000ff"/>
            ) : (
                <>
                    <Button title="Login" onPress={() => logIn()}/>
                    <Button title="Sign Up" onPress={() => signUp()}/>
                </>
            )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    root:{
        flex:1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF3E2',
    },
    logo:{
        width:'75%',
        maxWidth:200,
        height:100,
    },
})

export default SignIn;