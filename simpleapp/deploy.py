"""
Python script to deploy the Simple Appmanifest.json in the same directory
to a target bot.
Yes, this could have been a curl command.
No, I don't want to do that.
"""

import argparse
import urllib
from urllib import request

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("bot_url", help="URL of the bot. Example: https://kix.ada.support")
    parser.add_argument("auth_token", help="JWT Token to authorize the request. Request one from Chat Enrichment.")
    args = parser.parse_args()

    with open("manifest.json", "r") as manifest:
        req = request.Request(
            f"{args.bot_url}/api/apps-api/apps",
            manifest.read().encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "X-Ada-Simple-App-Auth": args.auth_token
            }
        )
        try:
            resp = request.urlopen(req)
        except urllib.error.HTTPError as e:
            print (f"Failed to deploy.\n{e}\n{e.read()}")
            exit(1)

        print("Deployed!")

if __name__ == "__main__":
    main()