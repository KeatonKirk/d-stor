# d-stor
d-Stor is a decentralized cloud storage platform utilizing decentralized encryption, access control and identity management for one of the first fully decentralized cloud storage platforms. 

# Stack
Chainsafe Storage API - Filecoin storage: https://docs.storage.chainsafe.io/
Lit Protocol - decentralized encryption and access control: https://developer.litprotocol.com/
Ceramic Network - Decentralized database: https://developers.ceramic.network/learn/welcome/
Self.id - Decentralized ID: https://self.id/
OpenZeppelin - NFT minting: https://docs.openzeppelin.com/

# User flow
Users who connect to d-Stor for the first time will be prompted to mint and NFT that will serve as the access control condition for decrypting their user info stored on Ceramic Network. Additionally, a Filecoin storage bucket will be created on first login using the Chainsafe API which will then be used for uploading and downloading files to/from Filecoin. Lit Protocol will use the newly minted NFT to decrypt all assets stored via chainsafe, resulting in secure and private decentralized cloud storage. The encryption key needed to access files will itself be encrypted and stored on the Ceramic network and associated with a self.id instance. Only the owner of the wallet that holds the access NFT will be able to decrypt any data, allowing for fully decentrtalized access control.

# Project Roadmap
October 2022 - Implement upload/download feature, launch on testnet
November 2022 - Front end styling and UX improvement
December 2022 - Implement gasless network to subsidize new user signups

2023 - Investigate custom decentralized ID solutions, launch on polygon or mainnet ethereum, decentralized node server hosting.
