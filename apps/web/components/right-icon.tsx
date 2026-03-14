"use client"
const Card = () => {
  return (
    <div className="card">
      <style>{`
        .card {
          position: relative;
          height: 300px;
          width: 230px;
        }
        .card .boxshadow {
          position: absolute;
          height: 100%;
          width: 100%;
          border: 1px solid red;
          transform: scale(0.8);
          box-shadow: rgb(255, 0, 0) 0px 30px 70px 0px;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .card .main {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(0deg, rgb(62, 0, 0) 0%, rgb(255, 0, 0) 60%, rgb(62, 0, 0) 100%);
          position: relative;
          clip-path: polygon(0 0, 100% 0, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 40px 100%, 0 calc(100% - 40px));
          box-shadow: rgb(255, 0, 0) 0px 7px 29px 0px;
          transition: all 0.3s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .card .main .top {
          position: absolute;
          top: 0px;
          left: 0;
          width: 0px;
          height: 0px;
          z-index: 2;
          border-top: 115px solid black;
          border-left: 115px solid transparent;
          border-right: 115px solid transparent;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .card .main .side {
          position: absolute;
          width: 100%;
          top: 0;
          transform: translateX(-50%);
          height: 101%;
          background: black;
          clip-path: polygon(0% 0%, 50% 0, 95% 45%, 100% 100%, 0% 100%);
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86) 1s;
        }
        .card .main .left { left: 0; }
        .card .main .right {
          right: 0;
          transform: translateX(50%) scale(-1, 1);
        }
        .card .main .title {
          position: absolute;
          left: 50%;
          top: 30%;
          transform: translate(-50%, -50%);
          font-weight: bold;
          font-size: 25px;
          opacity: 0;
          z-index: 10;
          white-space: nowrap;
          transition: all 0.2s ease-out 0s;
        }
        .card .main .button-container {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
        }
        .card .main .button-container .button {
          position: absolute;
          transform: translateX(-50%);
          padding: 5px 10px;
          clip-path: polygon(0 0, 100% 0, 81% 100%, 21% 100%);
          background: black;
          border: none;
          color: white;
          display: grid;
          place-content: center;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .card .main .button-container .button .svg {
          width: 15px;
          transition: all 0.2s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .card .main .button-container .button:nth-child(1) { bottom: 300px; transition-delay: 0.4s; }
        .card .main .button-container .button:nth-child(2) { bottom: 300px; transition-delay: 0.6s; }
        .card .main .button-container .button:nth-child(3) { bottom: 300px; transition-delay: 0.8s; }
        .card .main .button-container .button:hover .svg { transform: scale(1.2); }
        .card .main .button-container .button:active .svg { transform: scale(0.7); }
        .card:hover .main { transform: scale(1.1); }
        .card:hover .main .top { top: -50px; }
        .card:hover .main .left { left: -50px; transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86) 0.1s; }
        .card:hover .main .right { right: -50px; transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86) 0.1s; }
        .card:hover .main .title { opacity: 1; transition: all 0.2s ease-out 1.3s; }
        .card:hover .main .button-container .button:nth-child(1) { bottom: 80px; transition-delay: 0.8s; }
        .card:hover .main .button-container .button:nth-child(2) { bottom: 40px; transition-delay: 0.6s; }
        .card:hover .main .button-container .button:nth-child(3) { bottom: 0; transition-delay: 0.4s; }
      `}</style>

      <div className="boxshadow" />
      <div className="main">
        <div className="top" />
        <div className="left side" />
        <div className="right side" />
        <div className="title">DevNest PH</div>
        <div className="button-container">
          {/* MDN Web Docs */}
          <button
            className="button"
            onClick={() =>
              window.open("https://developer.mozilla.org", "_blank")
            }
          >
            <svg
              className="svg"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </button>

          {/* Latest Tech News - Dev.to */}
          <button
            className="button"
            onClick={() => window.open("https://dev.to", "_blank")}
          >
            <svg
              className="svg"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="red"
            >
              <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.29zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z" />
            </svg>
          </button>

          {/* GitHub Trending */}
          <button
            className="button"
            onClick={() => window.open("https://github.com/trending", "_blank")}
          >
            <svg
              className="svg"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Card
