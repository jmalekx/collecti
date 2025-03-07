import React, { useState } from 'react';
import { View, Button, TextInput, Image, StyleSheet, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView} from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import Logo from '../../../assets/images/tmplogo.png';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';

const SignIn = () => {
    const toast = useToast();
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
            toast.show("Login failed", {type: "danger",});
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
          const response = await createUserWithEmailAndPassword(auth, email, password);
          const user = response.user;
          const defaultPfp = 'https://i.pinimg.com/736x/9c/8b/20/9c8b201fbac282d91c766e250d0e3bc6.jpg';
          const defaultThumbnail = 'https://i.pinimg.com/736x/f6/51/5a/f6515a3403f175ed9a0df4625daaaffd.jpg';
      
          // Init profile
          const userRef = doc(FIREBASE_DB, 'users', user.uid);
          await setDoc(userRef, {
            email: user.email,
            username: user.email.split('@')[0],
            profilePicture: defaultPfp,
            bio: '',
            createdAt: new Date(),
            collections: 1, // Start with one collection: 'Unsorted'
            posts: 0,
          });
      
          // Create 'Unsorted' collection with a fixed ID
          const unsortedCollectionRef = doc(FIREBASE_DB, 'users', user.uid, 'collections', 'Unsorted');
          await setDoc(unsortedCollectionRef, {
            name: 'Unsorted',
            description: 'Posts not yet assigned to a collection',
            createdAt: new Date().toISOString(),
            items: [], // No items initially
            thumbnail: defaultThumbnail,
            isPinned: true,
          });
      
          toast.show("Sign up successful", {type: "success",});
        } catch (error) {
          console.log(error);
          toast.show("Sign up failed", {type: "danger",});
        } finally {
          setLoading(false);
        }
      };
    
    
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