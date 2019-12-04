module Day1
    ( run1,
      run2
    ) where

run1 :: String -> IO ()
run1 input = print (sum (map (fuel . read) (words input)))

run2 :: String -> IO ()
run2 input = print (sum (map (recFuel . read) (words input)))

fuel :: Int -> Int
fuel weight = max (div weight 3 - 2) 0

recFuel :: Int -> Int
recFuel weight 
  | f == 0 = 0
  | otherwise = f + recFuel f
  where f = fuel weight