import React, { useState } from 'kraft';
import { Link } from 'kraft/router';
export default function home(props) {
  const [name, setName] = useState([]);
  return (
    <div>
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
