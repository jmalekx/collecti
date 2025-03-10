import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView , TouchableOpacity, Text} from 'react-native';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import Logo from '../../../assets/images/tmplogo.png';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import commonStyles from '../../commonStyles';

const SignIn = ({ navigation }) => {
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

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, {height: height * 0.45}]} resizeMode='contain'/>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput 
                    value={email} 
                    style={styles.input} 
                    placeholder="Email" 
                    autoCapitalize="none" 
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput 
                    secureTextEntry={true} 
                    value={password} 
                    style={styles.input} 
                    placeholder="Password" 
                    autoCapitalize="none" 
                    onChangeText={(text) => setPassword(text)}
                />
            
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff"/>
                ) : (
                    <>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={logIn}
                    >
                    <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('SignUp')}
                    >
                    <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    ...commonStyles,
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

export default SignIn;