import ResidentLayout from '../../components/dashboard/ResidentLayout';
import SocietySettingsContent from '../../components/society/SocietySettingsContent';

function SocietyInformation() {
    return (
        <ResidentLayout>
            <SocietySettingsContent readOnly={true} />
        </ResidentLayout>
    );
}

export default SocietyInformation;