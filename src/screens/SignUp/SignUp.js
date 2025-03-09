import React, { useState } from 'react';
import { View, Button, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';

const SignUp = ({ navigation }) => {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signUp = async () => {
        if (password !== confirmPassword) {
            toast.show("Passwords don't match", {type: "warning"});
            return;
        }

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
                collections: 1,
                posts: 0,
            });
        
            // Create 'Unsorted' collection
            const unsortedCollectionRef = doc(FIREBASE_DB, 'users', user.uid, 'collections', 'Unsorted');
            await setDoc(unsortedCollectionRef, {
                name: 'Unsorted',
                description: 'Posts not yet assigned to a collection',
                createdAt: new Date().toISOString(),
                items: [],
                thumbnail: defaultThumbnail,
                isPinned: true,
            });
        
            toast.show("Sign up successful", {type: "success"});
        } catch (error) {
            console.log(error);
            toast.show("Sign up failed", {type: "danger"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput 
                    value={email} 
                    style={styles.input} 
                    placeholder="Email" 
                    autoCapitalize="none" 
                    onChangeText={setEmail}
                />
                <TextInput 
                    secureTextEntry={true} 
                    value={password} 
                    style={styles.input} 
                    placeholder="Password" 
                    autoCapitalize="none" 
                    onChangeText={setPassword}
                />
                <TextInput 
                    secureTextEntry={true} 
                    value={confirmPassword} 
                    style={styles.input} 
                    placeholder="Confirm Password" 
                    autoCapitalize="none" 
                    onChangeText={setConfirmPassword}
                />
            
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff"/>
                ) : (
                    <>
                        <Button title="Sign Up" onPress={signUp}/>
                        <Button 
                            title="Already have an account? Sign In" 
                            onPress={() => navigation.navigate('SignIn')}
                        />
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
    input: {
        backgroundColor: 'white',
        width: 300,
        height: 50,
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
})

export default SignUp;