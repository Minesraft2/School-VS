import React from "react";
const Prompt = ({ children, message, options }) => {
    return (
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 50%)', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
            <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                margin: 'auto',
                backgroundColor: options?.backgroundColor ?? 'white',
                width: options?.width ?? '50%',
                height: options?.height ?? '50%',
                minWidth: options?.minWidth ?? '300px',
                minHeight: options?.minHeight ?? '200px',
                borderRadius: options?.borderRadius ?? '10px',
                padding: options?.padding ?? '1.5rem'
            }}>
                <span>{message}</span>
                {children}
            </div>
        </div>
    )
}
export default Prompt;