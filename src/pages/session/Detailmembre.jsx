
import { Image } from "primereact/image";
import moment from "moment";
import UserImage from "/images/user.png";

export default function Detailmembre({detaildriver}) {
    return (

        <>
            <div className="row">
                <div className="col-sm mt-5 ">
                    <label htmlFor="" className="font-bold">
                    Locale
                    </label>
                    <div className="text-muted">
                        {detaildriver.LOCALE ? detaildriver.LOCALE : '-'}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Marque
                    </label>
                    <div className="text-muted">
                        {detaildriver.brand ? detaildriver.brand : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Nom du design
                    </label>
                    <div className="text-muted">
                        {detaildriver.designName ? detaildriver.designName : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Nom de l'appareil
                    </label>
                    <div className="text-muted">
                        {detaildriver.deviceName ? detaildriver.deviceName : '-'}
                    </div>
                </div>

            </div>


            <div className="row">
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Type d'appareil
                    </label>
                    <div className="text-muted">
                        {detaildriver.deviceType ? detaildriver.deviceType : '-'}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Fabricant
                    </label>
                    <div className="text-muted">
                        {detaildriver.manufacturer ? detaildriver.manufacturer : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    ID modèle
                    </label>
                    <div className="text-muted">
                        {detaildriver.modelId ? detaildriver.modelId : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Nom du modèle
                    </label>
                    <div className="text-muted">
                        {detaildriver.modelName ? detaildriver.modelName : '-'}
                    </div>
                </div>

            </div>


            <div className="row">
                <div className="col-sm mt-5" style={{ maxWidth: 260 }}>
                    <label htmlFor="" className="font-bold">
                        osBuildFingerprint

                    </label>
                    <div className="text-muted" style={{ wordBreak: 'break-word'}}>
                        {detaildriver.osBuildFingerprint ? detaildriver.osBuildFingerprint : '-'}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                        osBuildId
                    </label>
                    <div className="text-muted">
                        {detaildriver.osBuildId ? detaildriver.osBuildId : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                        osInternalBuildId

                    </label>
                    <div className="text-muted">
                        {detaildriver.osInternalBuildId ? detaildriver.osInternalBuildId : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5" style={{ maxWidth: 260 }}>
                    <label htmlFor="" className="font-bold">
                    osBuildFingerprint
                    </label>
                    <div className="text-muted" style={{ wordBreak: 'break-word'}}>
                        {detaildriver.osName ? detaildriver.osName : '-'}
                    </div>
                </div>

            </div>


            <div className="row">
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                        osVersion
                    </label>
                    <div className="text-muted">
                        {detaildriver.osVersion ? detaildriver.osVersion : '-'}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                        platformApiLevel
                    </label>
                    <div className="text-muted">
                        {detaildriver.platformApiLevel ? detaildriver.platformApiLevel : '-'}
                    </div>
                </div>
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Nom du produit
                    </label>
                    <div className="text-muted">
                        {detaildriver.productName ? detaildriver.productName : '-'}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    supportedCpuArchitectures
                    </label>
                    <div className="text-muted">
                        {detaildriver.supportedCpuArchitectures ? detaildriver.supportedCpuArchitectures : '-'}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Mémoire totale

                    </label>
                    <div className="text-muted">
                        {detaildriver.totalMemory ? detaildriver.totalMemory : '-'}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                    Date d'insertion
                    </label>
                    <div className="text-muted">
                    {moment(detaildriver.DATE_INSERTION).format("DD/MM/YYYY  HH:ss")}
                    </div>
                </div>


                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                        {/* productNam */}

                    </label>
                    <div className="text-muted">
                        {/* {detaildriver.productNam ? detaildriver.productNam : '-'} */}
                    </div>
                </div>

                <div className="col-sm mt-5">
                    <label htmlFor="" className="font-bold">
                        {/* productNam */}

                    </label>
                    <div className="text-muted">
                        {/* {detaildriver.productNam ? detaildriver.productNam : '-'} */}
                    </div>
                </div>
            </div>
        </>

    )
}





