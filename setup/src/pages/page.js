import React, { useState } from 'kraft';
import { Link } from 'kraft/router';

export default function page(props) {
  const [name, setName] = useState(props.name);
  return (
    <div>
      <h2 if={name}>are you {name}?</h2>
      <h1 if={!name}>
        you didn't tell me your name! <Link href="/">go back</Link>
      </h1>
    </div>
  );
}
