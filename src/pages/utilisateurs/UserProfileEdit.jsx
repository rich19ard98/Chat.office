import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Button } from "primereact/button";

const UserProfileEdit = ({ data, handleSubmit, handleChange, checkFieldData, hasError, getError, setValue, setError, profil, isSubmitting, getutilisateur }) => {
  return (
    <div className="px-4 py-3 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <Image
          src={getutilisateur?.IMAGE}
          alt="Profile Image"
          className="rounded-full border border-gray-300"
          width="100"
          height="100"
          imageStyle={{ objectFit: "cover" }}
          preview
        />
        <h2 className="mt-2 text-lg font-semibold">{data.NOM} {data.PRENOM}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <InputText
            type="text"
            placeholder="Ecrire le nom"
            name="NOM"
            value={data.NOM}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-full ${hasError("NOM") ? "p-invalid" : ""}`}
          />
          <div className="text-red-500 text-xs">{hasError("NOM") ? getError("NOM") : ""}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Prénom</label>
          <InputText
            type="text"
            placeholder="Ecrire le prénom"
            name="PRENOM"
            value={data.PRENOM}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-full ${hasError("PRENOM") ? "p-invalid" : ""}`}
          />
          <div className="text-red-500 text-xs">{hasError("PRENOM") ? getError("PRENOM") : ""}</div>
        </div>

        <div>
          <label className="block text-sm font-medium">Téléphone</label>
          <InputText
            type="text"
            placeholder="Numéro de téléphone"
            name="TELEPHONE"
            value={data.TELEPHONE}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-full ${hasError("TELEPHONE") ? "p-invalid" : ""}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Email</label>
          <InputText
            type="text"
            placeholder="Ecrire l'email"
            name="EMAIL"
            value={data.EMAIL}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-full ${hasError("EMAIL") ? "p-invalid" : ""}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Nom d'utilisateur</label>
          <InputText
            type="text"
            placeholder="Nom d'utilisateur"
            name="USERNAME"
            value={data.USERNAME}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-full ${hasError("USERNAME") ? "p-invalid" : ""}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Matricule</label>
          <InputText
            type="text"
            placeholder="Ecrire le matricule"
            name="MATRICULE"
            value={data.MATRICULE}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-full ${hasError("MATRICULE") ? "p-invalid" : ""}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Rôle</label>
          <Dropdown
            value={data.ID_PROFIL}
            options={profil}
            onChange={(e) => setValue("ID_PROFIL", e.value)}
            optionLabel="name"
            placeholder="Sélectionner un rôle"
            className={`w-full ${hasError("ID_PROFIL") ? "p-invalid" : ""}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Photo de profil</label>
          <FileUpload
            chooseLabel="Choisir l'image"
            name="image"
            accept="image/*"
            maxFileSize={4000000}
            onSelect={(e) => setValue("IMAGE", e.files[0])}
            onClear={() => setError("IMAGE", {})}
            className={`${hasError("IMAGE") ? "p-invalid" : ""}`}
          />
        </div>
      </form>

      <div className="flex justify-end mt-4 gap-2">
        <Button
          label="Réinitialiser"
          outlined
          onClick={(e) => {
            e.preventDefault();
            setData(initialForm);
            setErrors({});
          }}
        />
        <Button label="Modifier" type="submit" disabled={isSubmitting} />
      </div>
    </div>
  );
};

export default UserProfileEdit;
