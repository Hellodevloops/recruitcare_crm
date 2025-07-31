import { SVGAttributes } from 'react';

export default function MinimalAnalyticsIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 2C2.89543 2 2 2.89543 2 4V38C2 39.1046 2.89543 40 4 40H36C37.1046 40 38 39.1046 38 38V4C38 2.89543 37.1046 2 36 2H4ZM10 32C10.5523 32 11 31.5523 11 31V17C11 16.4477 10.5523 16 10 16C9.44772 16 9 16.4477 9 17V31C9 31.5523 9.44772 32 10 32ZM20 32C20.5523 32 21 31.5523 21 31V11C21 10.4477 20.5523 10 20 10C19.4477 10 19 10.4477 19 11V31C19 31.5523 19.4477 32 20 32ZM31 32C31.5523 32 32 31.5523 32 31V21C32 20.4477 31.5523 20 31 20C30.4477 20 30 20.4477 30 21V31C30 31.5523 30.4477 32 31 32Z"
                fill="currentColor"
            />
        </svg>
    );
}