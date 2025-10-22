import { useState } from "react";
import { fetchApi } from "../../utils/fetchApi";

export default function CreateConversationForm() {
  const [name, setName] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [participants, setParticipants] = useState([]); // tableau d'IDs utilisateurs

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      NAME: name,
      IS_GROUP: isGroup,
      PARTICIPANTS: participants
    };

    console.log({ data: payload });

    const res = await fetchApi("/messages/messages/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log(res);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nom de la conversation"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label>
        <input
          type="checkbox"
          checked={isGroup}
          onChange={(e) => setIsGroup(e.target.checked)}
        />
        Groupe
      </label>
      <input
        type="text"
        placeholder="IDs participants séparés par ,"
        onChange={(e) =>
          setParticipants(e.target.value.split(",").map((id) => id.trim()))
        }
        disabled={!isGroup}
      />
      <button type="submit">Créer</button>
    </form>
  );
}
