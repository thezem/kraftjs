import React, { useState } from 'kraftjs';
import { Link } from 'kraftjs/router';
export default function home(props) {
  const [name, setName] = useState([]);
  return (
    <div>
      <h2>{name}</h2>
      <input
        type="text"
        placeholder="what's your name?"
        onChange={(e) => setName(e.target.value)}
      />
      <Link href="/page" props={{ name: name }}>
        what this do!
      </Link>
    </div>
  );
}
