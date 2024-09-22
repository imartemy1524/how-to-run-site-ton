export default function Six() {
    return (
        <>
            <h2>Step #6</h2>

            <p>
                Run this reverse proxy (<code>./tonutils-reverse-proxy-linux-amd64</code>) in background using your favorite background runner (like <code>screen</code> or <code>tmux</code>, <code>systemctl</code> and etc.).
            </p>
            <h3>Important!</h3>
            <p>
                Don't forget to put your <code>config.json</code> file in the directory, where you run this proxy from.
            </p>

        </>
    );
}