//src/components/SearchForm.tsx

import React, { useState } from "react";

type Props = {
  onSearch: (searchTerm: string) => void;
};

const SearchForm: React.FC<Props> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Sök recept..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit">Sök</button>
    </form>
  );
};

export default SearchForm;
