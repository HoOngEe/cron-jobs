#!/usr/bin/python3

import math
import gzip
import os
import pickle
from functools import reduce
from collections import defaultdict
from parse import compile

pickled_filename = 'resulted_pickle'
# if match braces exist in target string then match those with double braces
round_pattern = compile("round-info {}-{}")
index_pattern = compile("index-info {}-{}-{}")

# FIXME parse node index
node_idx = {}
node_idx.update({"val10": 5})
node_idx.update({"val11": 4})
node_idx.update({"val20": 3})
node_idx.update({"val21": 2})
node_idx.update({"val30": 1})
node_idx.update({"val31": 0})

round_count = defaultdict(int)

def process_line(signer_idx, line, target_dict):
    round_result = round_pattern.search(line)
    index_result = index_pattern.search(line)
    if "eligible" in line:
        round_count[signer_idx] += 1
    if round_result is not None and index_result is not None:
        (height, view) = map(int, round_result.fixed)
        (_signer_idx, _sub_user_idx, elected_sub_users) = map(int, index_result.fixed)
        target_dict[(height, view)].update({signer_idx: elected_sub_users})

def parse_from_pickled(pickled_filename):
    with open(pickled_filename, 'rb') as f:
        result_dict = pickle.load(f)
        return (result_dict, {5: 34205, 4: 34204, 3: 34205, 2: 34205, 1: 34205, 0: 34204}) 

def parse_from_logs():
    target_dir = ["val10", "val11", "val20", "val21", "val30", "val31"]
    dict_for_idx_info = defaultdict(dict) 
    for dirname in target_dir:
        signer_idx = node_idx[dirname]
        target_files = []
        for filename in os.listdir(dirname):
            if filename.startswith("codechain.log"):
                target_files.append(dirname + "/" + filename)

        for filename in target_files:
            if filename.endswith('.gz'): 
                with gzip.open(filename, 'rt') as f:
                    for line in f:
                        process_line(signer_idx, line, dict_for_idx_info)
            else:
                with open(filename, "r") as f:
                    lines = f.readlines()
                    for line in lines:
                        process_line(signer_idx, line, dict_for_idx_info)
        print(round_count[signer_idx])
    with open(pickled_filename, 'wb') as f:
        pickle.dump(dict_for_idx_info, f)
    return (dict_for_idx_info, round_count)

def read_log():
    if pickled_filename in os.listdir("./"):
        return parse_from_pickled(pickled_filename)
    else:
        return parse_from_logs()
        
def sub_user_sum_reducer(accum_dict, dict_inst):
    for (key, value) in dict_inst.items():
        prev = accum_dict[key]
        accum_dict.update({key: prev + value})
    return accum_dict

def sub_user_square_sum_reducer(accum_dict, dict_inst):
    for (key, value) in dict_inst.items():
        prev = accum_dict[key]
        accum_dict.update({key: prev + value**2})
    return accum_dict

def filter_by_no_proposer(target_dict):
    print(target_dict)
    return reduce(lambda x, y: x + y, target_dict.values(), 0) == 0

def count_no_proposer(target_dict):
    return len(list(filter(filter_by_no_proposer, target_dict.values())))

def count_no_proposer_temp(target_dict):
    count = 0
    for i in range(34205):
        if target_dict.get((i, 0)) == None:
            count += 1
    return count

def reduce_dict_of_dict(inner_reducer, target_dict):
    result_dict = reduce(inner_reducer, target_dict.values(), defaultdict(int))
    return result_dict

(dict_for_idx_info, round_count) = read_log()

sub_user_sum_dict = reduce_dict_of_dict(sub_user_sum_reducer, dict_for_idx_info)
sub_user_square_sum_dict = reduce_dict_of_dict(sub_user_square_sum_reducer, dict_for_idx_info)
#total_sub_users_per_round_dict = reduce_dict_of_dict(round_sub_users_reducer, dict_for_idx_info)

no_proposer_count = count_no_proposer_temp(dict_for_idx_info)

print (F"Round count is {round_count}")

for (key, value) in sub_user_sum_dict.items():
    mean = value / round_count[key]
    square_mean = (sub_user_square_sum_dict[key]) / round_count[key]
    standard_deviation = math.sqrt(square_mean - mean**2)
    if round_count == 0:
        print("Maybe randomized election is off?")
    else:
        print(F"Average number of elected sub-user is {mean} and standard deviation is {standard_deviation}")

print(F"The number of no proposer round is {no_proposer_count} which occupies {no_proposer_count / round_count[0]} / ")
