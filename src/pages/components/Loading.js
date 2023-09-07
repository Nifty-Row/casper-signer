import Image from "next/image";
import React from "react";

const Loading = () => {
  return (
    <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(236, 244, 244, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
            <Image src="/loading.gif"  width={100} height={100}/>
          {/* <div className="spinner-border" role="status">
            <span className="sr-only"></span>
          </div> */}
        </div>
  );
};

export default Loading;
