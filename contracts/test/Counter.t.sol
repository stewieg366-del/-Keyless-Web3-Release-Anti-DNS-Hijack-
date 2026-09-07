// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {PS2Counter} from "../src/PS2Counter.sol";

contract CounterTest is Test {
    PS2Counter public counter;

    function setUp() public {
        counter = new PS2Counter();
    }

    function test_Increment() public {
        assertEq(counter.count(), 0);
        counter.increment();
        assertEq(counter.count(), 1);
    }
}
