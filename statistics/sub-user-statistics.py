#!/usr/bin/python3

import gzip
import os
from functools import reduce
from parse import compile

# if match braces exist in target string then match those with double braces
round_pattern = compile("round-info {}-{}")
index_pattern = compile("index-info {}-{}-{}")
round_count = 0
dict_for_idx_info = dict()

def process_line(line):
    global round_count
    round_result = round_pattern.search(line)
    index_result = index_pattern.search(line)
    if "eligible" in line:
        round_count += 1
    if round_result is not None and index_result is not None:
        (height, view) = map(int, round_result.fixed)
        (signer_idx, _sub_user_idx, elected_sub_users) = map(int, index_result.fixed)
        dict_for_idx_info.update({(height, view, signer_idx): elected_sub_users})

target_files = []

for filename in os.listdir("./"):
    if filename.startswith("codechain.log"):
        target_files.append(filename)

for filename in target_files:
    if filename.endswith('.gz'): 
        with gzip.open(filename, 'rt') as f:
            for line in f:
                process_line(line)
    else:
        with open(filename, "r") as f:
            lines = f.readlines()
            for line in lines:
                process_line(line)

sub_user_sum = reduce(lambda x, y: x + y, dict_for_idx_info.values(), 0)

print (F"Round count is {round_count}")
if round_count == 0:
    print("Maybe randomized election is off?")
else:
    print(F"Average number of elected sub-user is {sub_user_sum / round_count}")
