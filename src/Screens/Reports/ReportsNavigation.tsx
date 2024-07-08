import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomTabBar from '../../components/Tabbar/customTabBar';
import Reports from './Reports';
import Report from './Report';

const Stack = createNativeStackNavigator();

function ReportsNavigation() {
  return (
    <Stack.Navigator initialRouteName={'ReportList'}>
      <Stack.Screen
        name="ReportList"
        component={Reports}
        options={{title: 'Reports', headerRight: () => <CustomTabBar />}}
      />
      <Stack.Screen
        name="ReportDetail"
        component={Report}
        options={{title: 'Report Detail'}}
      />
    </Stack.Navigator>
  );
}

export default ReportsNavigation;
