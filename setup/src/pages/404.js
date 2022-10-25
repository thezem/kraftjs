import React from 'kraft';

export default function NotFound() {
  // this page is rendered when a route is not found
  // by default kraft renders it's own 404 page if it is not found in your ./pages folder
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  );
}
