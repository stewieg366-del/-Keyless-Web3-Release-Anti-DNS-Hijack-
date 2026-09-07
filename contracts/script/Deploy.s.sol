// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PS2Counter} from "../src/PS2Counter.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        PS2Counter counter = new PS2Counter();
        console.log("PS2Counter deployed at:", address(counter));

        vm.stopBroadcast();
    }
}
