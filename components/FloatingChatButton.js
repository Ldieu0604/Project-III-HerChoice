import React, { useState} from 'react';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';

const FloatingChatButton = ({ onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: 'https://res.cloudinary.com/do06pcpma/image/upload/v1766654733/Different_Types_Of_Casino_Bonuses_-_Robot_Logo_-_Free_Transparent_PNG_Clipart_Images_Download__ClipartMax__1_-removebg-preview_xnvn2p.png' }}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    bottom: 80,          
    right: 20,           
    width: 60,
    height: 60,
    borderRadius: 30,    
    backgroundColor: '#00CED1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,         
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,          
  },
  icon: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
});

export default FloatingChatButton;