export default function Fourth() {
    return (
        <>
            <h2>Step #4</h2>
            <p>
                Run installed binary to initialize the config file:
                <code>./tonutils-reverse-proxy-linux-amd64</code>
            </p>
            <p>
                It would create a <code>config.json</code> file in the root of your folder. <br/>
                It should look something like this:
            </p>
            <code>
                {"{"}
                "proxy_pass": "http://127.0.0.1:3000/",
                "private_key": "Z+string=",
                "external_ip": "1.2.3.4",
                "listen_ip": "0.0.0.0",
                "network_config_url": "https://ton.org/global.config.json",
                "port": 11706
                {"}"}
            </code>
            <p>
                You need to change:
                <ul>
                    <li><code>proxy_pass</code> to your local server address (in our case, <code>localhost:3000</code>)</li>
                    <li><code>external_ip</code> to your external IP - you'll need <b>White IP</b> to do so</li>
                    <li><code>port</code> - port for incoming connections</li>
                </ul>
                <strong>Don't forget</strong> to open the <code>port</code> above in your firewall!! <br/>
                Otherwise, website won't work.
            </p>

        </>
    );
}