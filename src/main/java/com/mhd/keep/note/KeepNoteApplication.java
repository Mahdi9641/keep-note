package com.mhd.keep.note;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KeepNoteApplication {

	public static void main(String[] args) {
		SpringApplication.run(KeepNoteApplication.class, args);
	}

}
