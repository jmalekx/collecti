import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView , TouchableOpacity, Text} from 'react-native';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import Logo from '../../../assets/images/tmplogo.png';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import commonStyles from '../../commonStyles';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';
import { showToast, TOAST_TYPES } from '../../components/Toasts';

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
            showToast(toast,"Login failed", {type: TOAST_TYPES.DANGER});
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.root}>
            <Image source={Logo} style={[styles.logo, {height: height * 0.45}]} resizeMode='contain'/>
            <KeyboardAvoidingView behavior='padding'>
                <AppTextInput 
                    value={email} 
                    style={styles.input} 
                    placeholder="Email" 
                    autoCapitalize="none" 
                    onChangeText={(text) => setEmail(text)}
                />
                <AppTextInput 
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
                    <AppButton
                        style={styles.button}
                        title="Login"
                        onPress={logIn}
                    />
                    <AppButton
                        style={styles.button}
                        title="Sign Up"
                        onPress={() => navigation.navigate('SignUp')}
                    />
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
    },
    logo:{
        width:'75%',
        maxWidth:200,
        height:100,
    },
})

export default SignIn;