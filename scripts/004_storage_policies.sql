-- Storage 버킷에 대한 정책 추가

-- uploads 버킷에 대한 SELECT (읽기) 권한 부여
CREATE POLICY "Allow public read access on uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

-- uploads 버킷에 대한 INSERT (업로드) 권한 부여
CREATE POLICY "Allow public insert access on uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- uploads 버킷에 대한 UPDATE 권한 부여 (선택사항)
CREATE POLICY "Allow public update access on uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- uploads 버킷에 대한 DELETE 권한 부여 (선택사항)
CREATE POLICY "Allow public delete access on uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads');



