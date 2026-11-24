import DashboardLayout from '../../components/dashboard/dashboardLayout';
import SocietySettingsContent from '../../components/society/SocietySettingsContent';

function SocietySettings() {
    return (
        <DashboardLayout>
            <SocietySettingsContent readOnly={false} />
        </DashboardLayout>
    );
}

export default SocietySettings;