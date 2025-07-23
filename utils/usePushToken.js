// utils/PushToken.js
import { useEffect } from 'react';
import { registerForPushNotifications } from './registerForPushNotifications';

const usePushToken = () => {
  useEffect(() => {
    registerForPushNotifications();
  }, []);
};

export default usePushToken;
